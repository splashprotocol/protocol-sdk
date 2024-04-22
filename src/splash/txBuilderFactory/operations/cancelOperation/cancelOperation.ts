import {
  NetworkId,
  PlutusData,
} from '@dcspark/cardano-multiplatform-lib-browser';

import { Output } from '../../../../core/models/output/Output.ts';
import {
  OutputReference,
  OutputReferenceHash,
} from '../../../../core/types/types.ts';
import { Operation } from '../common/Operation.ts';
import { OutputAlreadySpentError } from './errors/OutputAlreadySpentError.ts';
import { OutputNotFoundError } from './errors/OutputNotFoundError.ts';
import { SupportedOperationNotFoundError } from './errors/SupportedOperationNotFoundError.ts';

export const cancelOperation: Operation<
  [OutputReference | OutputReferenceHash]
> =
  (outputReferenceOrHash) =>
  async ({
    network,
    transactionCandidate,
    operationsConfig,
    splash,
    pParams,
  }) => {
    let outputReference: OutputReference;

    if (outputReferenceOrHash instanceof Object) {
      outputReference = outputReferenceOrHash;
    } else {
      const [txHash, index] = outputReferenceOrHash.split(':');
      outputReference = { txHash, index: BigInt(index) };
    }

    const uTxOToCancel = await splash.api.getUTxOByRef(outputReference);

    if (!uTxOToCancel) {
      throw new OutputNotFoundError(
        `Output with ref ${outputReference.txHash}:${outputReference.index} not found`,
      );
    }

    const supportedOperations = Object.values(operationsConfig.operations);
    const operationConfig = supportedOperations.find(
      (op) => op.script === uTxOToCancel.paymentCredentials,
    );

    if (!operationConfig) {
      throw new SupportedOperationNotFoundError(
        `Supported operation not found in Output with ref: ${outputReference.txHash}:${outputReference.index}`,
      );
    }
    if (uTxOToCancel.spent) {
      throw new OutputAlreadySpentError(
        `Output with ref: ${outputReference.txHash}:${outputReference.index} already spent`,
      );
    }

    const creds = operationConfig.credsDeserializer(
      network === 'mainnet' ? NetworkId.mainnet() : NetworkId.testnet(),
      uTxOToCancel.wasmOutput.datum()?.as_datum()?.to_cbor_hex()!,
    );

    transactionCandidate.addInput(uTxOToCancel, {
      redeemer: PlutusData.from_cbor_hex(operationConfig.refundData.redeemer),
      scriptRef:
        network === 'mainnet'
          ? operationConfig.refundData.refUtxo.mainnet
          : operationConfig.refundData.refUtxo.preprod,
      // TODO: NEED TO REWRITE
      requiredSigners: [creds.requiredSigner],
      script: operationConfig.script,
      plutusV2ScriptCbor: operationConfig.refundData.plutusV2ScriptCbor,
      exUnits: {
        mem: BigInt(operationConfig.refundData.cost.mem),
        steps: BigInt(operationConfig.refundData.cost.steps),
      },
      data: uTxOToCancel.wasmOutput.datum()?.as_datum(),
    });
    transactionCandidate.addOutput(
      Output.new(pParams, {
        address: creds.address,
        value: uTxOToCancel.value,
      }),
    );
  };
