use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode{
    #[msg("Invitation not found.")]
    InvitationNotFound,
    #[msg("Invalid Invitation")]
    InvalidInvitation,
}