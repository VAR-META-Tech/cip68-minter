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

pub const author_key: ByteArray = "_pk"
