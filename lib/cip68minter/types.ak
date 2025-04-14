// Types for CIP68 token operations

// Redeemer for mint validator - defines the token operations
pub type MintRedeemer {
  Mint
  Burn
}

// Redeemer for store validator - defines the datum operations
pub type StoreRedeemer {
  Update
  Remove
}

// Key used to store the author's verification key hash in the token's datum
pub const author_key: ByteArray = "_pk"
