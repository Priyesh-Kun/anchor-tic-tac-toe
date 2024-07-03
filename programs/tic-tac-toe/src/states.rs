use anchor_lang::prelude::*;

#[account]
pub struct PlayerData {
    pub authority: Pubkey,
    pub tiles: [u8; 3],  // will have a array of 3 elements with unique values from 1..9
    pub in_game: bool,
    pub has_chance: bool,
    pub last_game: u8,
    pub last_invitation: u8,
    pub game_account: Pubkey
}

#[account]
pub struct GameData {
    pub inviter: Pubkey,
    pub invitee: Pubkey,
    pub is_finished: bool,
    pub winner: Pubkey,
}

#[account]
pub struct InvitationsAccount{
    pub invitations: Vec<Invitation>,
}

#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub struct Invitation{
    pub index: u8,
    pub inviter_authority: Pubkey,
    pub invitee_authority: Pubkey,
    pub inviter: Pubkey,
    pub invitee: Pubkey,
    pub game_account: Pubkey,
    pub pending: bool
}

impl Space for Invitation {
    const INIT_SPACE: usize = 1 + 32 + 32 + 32 + 32 + 32 + 1;
}

impl Space for PlayerData {
    const INIT_SPACE: usize = 32 + 3  + 1 + 1 + 1 + 1 + 32;
}

impl Space for GameData {
    const INIT_SPACE: usize = 32 + 32  + 1 + 32;
}