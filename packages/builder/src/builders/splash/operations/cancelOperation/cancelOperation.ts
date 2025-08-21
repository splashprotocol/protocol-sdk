import { OutputAlreadySpentError } from './errors/OutputAlreadySpentError.ts';
import { OutputNotFoundError } from './errors/OutputNotFoundError.ts';
import { SupportedOperationNotFoundError } from './errors/SupportedOperationNotFoundError.ts';
import { Operation } from '../../../../core/types/Operation.ts';
import {
  Bech32String,
  CborHexString,
  HexString,
  Network,
  OutputReference,
  OutputReferenceHash,
} from '@splashprotocol/core';
import { Output } from '../../../../core/models/Output/Output.ts';
import { BasicApi } from '@splashprotocol/api';
import { getSplashOperationConfig } from '../common/getSplashOperationConfig.ts';
import { SplashOperationsConfig } from '../common/SplashOperationsConfig.ts';
import { spectrumSwapDatum } from './legacyDatums/spectrumSwapDatum/spectrumSwapDatum.ts';

import { credentialsToBech32Address } from '../../../../core/utils/credentialsToBech32Address/credentialsToBech32Address.ts';
import { spotOrderDatum } from '../spotOrder/spotOrderDatum/spotOrderDatum.ts';
import { Credentials } from '../../../../core/types/Credentials.ts';
import { xyRedeemDatum } from '../xyRedeem/xyRedeemDatum/xyRedeemDatum.ts';
import { xyDepositDatum } from '../xyDeposit/xyDepositDatum/xyDepositDatum.ts';

export const anySpotOrderDeserializer = async (
  network: Network,
  cbor: CborHexString,
): Promise<{ address: Bech32String; requiredSigner: HexString }> => {
  const deserializedData = await spotOrderDatum.deserialize(cbor);

  let paymentCredentials: Credentials;
  let stakeCredentials: Credentials | undefined = undefined;

  // @ts-ignore
  if (deserializedData.address.paymentCredentials.paymentKeyHash) {
    paymentCredentials = {
      type: 'pubKey',
      // @ts-ignore
      hash: deserializedData.address.paymentCredentials.paymentKeyHash,
    };
  } else {
    paymentCredentials = {
      type: 'script',
      // @ts-ignore
      hash: deserializedData.address.paymentCredentials.scriptHash,
    };
  }

  // @ts-ignore
  if (deserializedData.address.stakeCredentials.paymentKeyHash) {
    stakeCredentials = {
      type: 'pubKey',
      // @ts-ignore
      hash: deserializedData.address.stakeCredentials.paymentKeyHash,
    };
    //@ts-ignore
  } else if (deserializedData.address.stakeCredentials.scriptHash) {
    stakeCredentials = {
      type: 'script',
      // @ts-ignore
      hash: deserializedData.address.stakeCredentials.scriptHash,
    };
  }

  return {
    requiredSigner: paymentCredentials.hash,
    address: await credentialsToBech32Address(
      network,
      paymentCredentials,
      stakeCredentials,
    ),
  };
};

const anyRedeemDeserializer = async (
  network: Network,
  cbor: CborHexString,
): Promise<{ address: Bech32String; requiredSigner: HexString }> => {
  const deserializedData = await xyRedeemDatum.deserialize(cbor);
  const pkh = deserializedData.pkh;
  const skh = deserializedData.skh;

  return {
    address: await credentialsToBech32Address(
      network,
      {
        hash: pkh,
        type: 'pubKey',
      },
      typeof skh === 'string'
        ? {
            hash: skh,
            type: 'pubKey',
          }
        : undefined,
    ),
    requiredSigner: pkh,
  };
};

const anyDepositDeserializer = async (
  network: Network,
  cbor: CborHexString,
): Promise<{ address: Bech32String; requiredSigner: HexString }> => {
  const deserializedData = await xyDepositDatum.deserialize(cbor);
  const pkh = deserializedData.pkh;
  const skh = deserializedData.skh;

  return {
    address: await credentialsToBech32Address(
      network,
      {
        hash: pkh,
        type: 'pubKey',
      },
      typeof skh === 'string'
        ? {
            hash: skh,
            type: 'pubKey',
          }
        : undefined,
    ),
    requiredSigner: pkh,
  };
};

const splashOperationDeserializers: {
  [key in keyof SplashOperationsConfig['operations']]: (
    network: Network,
    cbor: CborHexString,
  ) => Promise<{ address: Bech32String; requiredSigner: HexString }>;
} = {
  swapDefault: async (network, cbor) => {
    const deserializedData = await spectrumSwapDatum.deserialize(cbor);
    const pkh = deserializedData.rewardPkh;
    const skh = deserializedData.stakePkh;

    const address = await credentialsToBech32Address(
      network,
      {
        hash: pkh,
        type: 'pubKey',
      },
      typeof skh === 'string'
        ? {
            hash: skh,
            type: 'pubKey',
          }
        : undefined,
    );

    return {
      requiredSigner: pkh,
      address: address,
    };
  },
  spotOrder: anySpotOrderDeserializer,
  spotOrderV2: anySpotOrderDeserializer,
  spotOrderV3: anySpotOrderDeserializer,
  snekfunOrder: anySpotOrderDeserializer,
  snekfunOrderV2: anySpotOrderDeserializer,
  redeemFeeSwitch: anyRedeemDeserializer,
  redeemWeighted: anyRedeemDeserializer,
  redeemWeightedV2: anyRedeemDeserializer,
  redeemDefault: anyRedeemDeserializer,
  redeemStable: anyRedeemDeserializer,
  redeemRoyalty: anyRedeemDeserializer,
  depositDefault: anyDepositDeserializer,
  depositWeighted: anyDepositDeserializer,
  depositWeightedOld: anyDepositDeserializer,
  depositFeeSwitch: anyDepositDeserializer,
  depositStable: anyDepositDeserializer,
  depositRoyalty: anyDepositDeserializer,
};

export type OperationDatumDeserializer = (
  network: Network,
  datumCbor: string,
) => Promise<{ requiredSigner: HexString; address: Bech32String }>;

export const cancelOperation: Operation<
  [
    OutputReference | OutputReferenceHash,
    OperationDatumDeserializer?,
    boolean?,
  ],
  BasicApi,
  Output
> =
  (outputReferenceOrHash, deserializer, needTtl) =>
  async ({ network, transactionCandidate, explorer, pParams, C, nContext }) => {
    const operationsConfig = await getSplashOperationConfig();
    let outputReference: OutputReference;

    if (outputReferenceOrHash instanceof Object) {
      outputReference = outputReferenceOrHash;
    } else {
      const [txHash, index] = outputReferenceOrHash.split(':');
      outputReference = { txHash, index: BigInt(index) };
    }

    const uTxOToCancel = await explorer.getUTxOByRef(outputReference);

    if (!uTxOToCancel) {
      throw new OutputNotFoundError(
        `Output with ref ${outputReference.txHash}:${outputReference.index} not found`,
      );
    }

    const supportedOperations = Object.entries(operationsConfig.operations);
    const operationConfigKeyValue = supportedOperations.find(
      (op) => op[1].script === uTxOToCancel.paymentCredentials,
    );

    if (!operationConfigKeyValue) {
      throw new SupportedOperationNotFoundError(
        `Supported operation not found in Output with ref: ${outputReference.txHash}:${outputReference.index}`,
      );
    }
    if (uTxOToCancel.spent) {
      throw new OutputAlreadySpentError(
        `Output with ref: ${outputReference.txHash}:${outputReference.index} already spent`,
      );
    }

    const [operationConfigKey, operationConfig] = operationConfigKeyValue;

    const creds = deserializer
      ? await deserializer(
          network,
          uTxOToCancel.wasmOutput.datum()?.as_datum()?.to_cbor_hex()!,
        )
      : await splashOperationDeserializers[operationConfigKey](
          network,
          uTxOToCancel.wasmOutput.datum()?.as_datum()?.to_cbor_hex()!,
        );

    transactionCandidate.addInput(uTxOToCancel, {
      redeemer: operationConfig.refundData.redeemer,
      uTxORef:
        network === 'mainnet'
          ? operationConfig.refundData.refUtxo.mainnet
          : operationConfig.refundData.refUtxo.preprod,
      // TODO: NEED TO REWRITE
      requiredSigners: [creds.requiredSigner],
      scriptHash: operationConfig.script,
      script: operationConfig.refundData.plutusV2ScriptCbor,
      exUnits: {
        mem: BigInt(operationConfig.refundData.cost.mem),
        steps: BigInt(operationConfig.refundData.cost.steps),
      },
      data: uTxOToCancel.wasmOutput.datum()?.as_datum()?.to_cbor_hex(),
    });

    const cancelOutput = Output.newSync(C, pParams, {
      address: creds.address,
      value: uTxOToCancel.value,
    });

    if (needTtl) {
      transactionCandidate.setRangeStart(BigInt(nContext.slotNo - 2));
    }

    transactionCandidate.addOutput(cancelOutput);
    return cancelOutput;
  };
