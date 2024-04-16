import {
  Address,
  PlutusData,
} from '@dcspark/cardano-multiplatform-lib-browser';

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
  async ({ userAddress, transactionCandidate, operationsConfig, splash }) => {
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

    transactionCandidate.addInput(uTxOToCancel, {
      redeemer: PlutusData.from_cbor_hex('d8799f00000001ff'),
      scriptRef: {
        txHash: operationConfig.refundData.refUtxo.txHash,
        index: BigInt(operationConfig.refundData.refUtxo.index),
      },
      // TODO: NEED TO REWRITE
      requiredSigners: [
        Address.from_bech32(userAddress)
          .payment_cred()
          ?.as_pub_key()
          ?.to_hex()!,
      ],
      script: operationConfig.script,
      exUnits: {
        mem: BigInt(operationConfig.refundData.cost.mem),
        steps: BigInt(operationConfig.refundData.cost.steps),
      },
      data: uTxOToCancel.wasmOutput.datum()?.as_datum(),
    });
  };
