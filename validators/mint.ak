use aiken/collection/list
use aiken/crypto.{ScriptHash, VerificationKeyHash}
use cardano/address
use cardano/assets.{PolicyId, without_lovelace}
use cardano/transaction.{Transaction}
use cip68minter/types.{Burn, Mint, MintRedeemer}
use cip68minter/utils
use types/cip68

validator mint(
  store_payment_credential: ScriptHash,
  store_stake_credential: VerificationKeyHash,
  issuer: VerificationKeyHash,
) {
  mint(redeemer: MintRedeemer, policy_id: PolicyId, transaction: Transaction) {
    let Transaction { inputs, outputs, extra_signatories, mint, .. } =
      transaction
    let mint_flatten =
      mint
        |> without_lovelace()
        |> assets.flatten()
    let store_address =
      store_payment_credential
        |> address.from_script()
        |> address.with_delegation_key(store_stake_credential)
    when redeemer is {
      Mint ->
        utils.check_asset_mint(
          mint_flatten,
          policy_id,
          cip68.prefix_100,
          cip68.prefix_222,
          outputs,
          store_address,
          issuer,
          extra_signatories,
          False,
        )?
      Burn -> {
        let reference_asset =
          utils.find_input_reference_asset(inputs, extra_signatories)

        if list.length(reference_asset) > 0 {
          let mint_concat = list.concat(reference_asset, mint_flatten)
          utils.check_asset_burn(
            mint_concat,
            policy_id,
            cip68.prefix_100,
            cip68.prefix_222,
          )?
        } else {
          utils.check_assets_prefix(mint_flatten, policy_id, cip68.prefix_222)?
        }
      }
    }
  }

  else(_) {
    fail
  }
}
