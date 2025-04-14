use aiken/collection/list
use aiken/crypto.{ScriptHash, VerificationKeyHash}
use cardano/address
use cardano/assets.{PolicyId, without_lovelace}
use cardano/transaction.{Transaction}
use cip68minter/types.{Burn, Mint, MintRedeemer}
use cip68minter/utils
use types/cip68

// @validator: Mint
// @description: Validator is used to mint and burn tokens (nft, token) according to CIP68
// @params - store_payment_credential: The script hash of the store validator for holding CIP68 reference tokens.
// @params - store_stake_credential: The stake key hash used in the store validator address.
// @params - issuer: The verification key hash of the token issuer who can authorize token actions.
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
      // @action: Mint -  Conditions for minting assets (NFT/Token)
      // - check_signed_by_author: When a user mints an asset, the datum of the store validator contains an author field
      // and the user must provide a signature to identify that this is the author who minted the asset.
      // - check_format_asset: Check that the specified fields such as name, image, media_type, author exist in the store validator's datum (ask asset metadata).
      // - check_store_address: Check that the asset (CIP100) sent to an address must be the store validator's address
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
        )
      // @action: Burn - Conditions for burning assets (NFT/Token)
      // - signed_by_author: When a user performs asset burning, the datum of the store validator contains an author field
      // and the user must provide a signature to identify that this is the author performing the asset burning transaction.
      // - check_amount: Check that the amount of user tokens the sender wants to burn is valid and does not exceed the amount they own.
      // - check_amount_burn: The author will burn both NFTs (User Token, Reference Token) with the given amount.
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
          )
        } else {
          utils.check_assets_prefix(mint_flatten, policy_id, cip68.prefix_222)
        }
      }
    }
  }

  else(_) {
    fail
  }
}
