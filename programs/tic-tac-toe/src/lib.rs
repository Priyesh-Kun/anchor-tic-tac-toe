use anchor_lang::prelude::*;

pub mod errors;
pub mod states;

use errors::ErrorCode;
use states::*;

declare_id!("AmjKDcAmfZHesXUmcn3e8Z1jDoDActvSm9ooZXiUKuTY");

pub fn push_tile(tile: u8, mut tiles: [u8; 3]) -> [u8; 3] {
    for i in 0..3 {
        if i == 2 {
            tiles[i] = tile;
        } else {
            tiles[i] = tiles[i + 1];
        }
    }
    tiles
}

pub fn is_winning_combination(tiles: & [u8; 3]) -> bool {
    let winning_combinations: [[u8; 3]; 8] = [
        [1, 2, 3], // Row 1
        [4, 5, 6], // Row 2
        [7, 8, 9], // Row 3
        [1, 4, 7], // Column 1
        [2, 5, 8], // Column 2
        [3, 6, 9], // Column 3
        [1, 5, 9], // Diagonal 1
        [3, 5, 7], // Diagonal 2
    ];

    for &comb in winning_combinations.iter() {
        if tiles.contains(&comb[0]) && tiles.contains(&comb[1]) && tiles.contains(&comb[2]) {
            return true;
        }
    }

    false
}

#[program]
pub mod tic_tac_toe {
    use super::*;

    pub fn initialize_player(ctx: Context<InitializePlayer>) -> Result<()> {
        let player_account = &mut ctx.accounts.player;

        player_account.authority = ctx.accounts.authority.key();
        player_account.tiles = [0; 3];
        player_account.in_game = false;
        player_account.has_chance = false;
        player_account.last_game = 0;

        msg!("Player Account Initialized!");
        Ok(())
    }

    pub fn initialize_invitations_account(
        _ctx: Context<InitializeInvitationsAccount>,
    ) -> Result<()> {
        msg!("Invitations Account Initialized!");
        Ok(())
    }

    pub fn create_invitation(ctx: Context<CreateInvitation>) -> Result<()> {
        let invitations_account = &mut ctx.accounts.invitations_account;
        let game_account = &mut ctx.accounts.game_account;
        let inviter_account = &ctx.accounts.inviter;
        let invitee_account = &ctx.accounts.invitee;

        game_account.inviter = inviter_account.key();
        game_account.invitee = invitee_account.key();
        game_account.is_finished = false;
        let index = invitations_account.invitations.len() as u8;

        invitations_account.invitations.push(Invitation {
            index,
            inviter_authority: ctx.accounts.inviter_authority.key(),
            invitee_authority: ctx.accounts.invitee_authority.key(),
            inviter: inviter_account.key(),
            invitee: invitee_account.key(),
            game_account: game_account.key(),
            pending: true,
        });

        msg!("Invitation Sent!");
        Ok(())
    }

    pub fn accept_invitation(
        ctx: Context<AcceptInvitaton>, 
        invitation: Invitation
    ) -> Result<()> {
        let invitations = &mut ctx.accounts.invitations_account.invitations;

        if let Some(pos) = invitations.iter().position(|inv| {
            inv.invitee == invitation.invitee
                && inv.inviter == invitation.inviter
                && inv.game_account == invitation.game_account
        }) {
            let invitaion_data = &mut invitations[pos];
            let inviter_account = &mut ctx.accounts.inviter;
            let invitee_account = &mut ctx.accounts.invitee;
            let game_account = &mut ctx.accounts.game_account;

            invitaion_data.pending = false;
            inviter_account.has_chance = true;
            invitee_account.has_chance = false;
            inviter_account.in_game = true;
            invitee_account.in_game = true;
            inviter_account.last_invitation = invitaion_data.index;
            invitee_account.last_invitation = invitaion_data.index;
            inviter_account.game_account = game_account.key();
            invitee_account.game_account = game_account.key();
            invitations[pos].pending = false;
            msg!("Invitation accepted!");
        } else {
            return err!(ErrorCode::InvitationNotFound);
        }
        Ok(())
    }

    pub fn make_move(
        ctx: Context<MakeMove>, 
        invitation: Invitation, 
        tile: u8
    ) -> Result<()> {
        let player_account = &mut ctx.accounts.player;
        let opponent_account = &mut ctx.accounts.opponent;
        let game_account = &mut ctx.accounts.game_account;

        if game_account.key() == invitation.game_account {
            let tile_data = push_tile(tile, player_account.tiles);

            if !is_winning_combination(&tile_data){
                player_account.tiles = tile_data;
                player_account.has_chance = false;
                opponent_account.has_chance = true;
                msg!("Move Made!");
            }
            else {
                game_account.is_finished = true;
                game_account.winner = player_account.key();
                player_account.last_game += 1;
                player_account.in_game = false;
                opponent_account.in_game = false;
                opponent_account.last_game += 1;
                player_account.tiles = [0;3];
                opponent_account.tiles = [0;3];
                msg!("Game Finished!");
            }
        }
        else {
            return err!(ErrorCode::InvalidInvitation);
        }

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializePlayer<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
    #[account(
        init,
        payer=authority,
        space= 8+PlayerData::INIT_SPACE,
        seeds=[
            b"USER_STATE",
            authority.key().as_ref(),
        ],
        bump,
    )]
    pub player: Account<'info, PlayerData>,
}

#[derive(Accounts)]
pub struct InitializeInvitationsAccount<'info> {
    pub system_program: Program<'info, System>,
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        init,
        payer = payer,
        space = 8 + std::mem::size_of::<InvitationsAccount>(),
        seeds=[
            b"INVITATION_STATE"
        ],
        bump
    )]
    pub invitations_account: Account<'info, InvitationsAccount>,
}

#[derive(Accounts)]
pub struct CreateInvitation<'info> {
    pub system_program: Program<'info, System>,
    #[account(mut)]
    pub inviter_authority: Signer<'info>,
    /// CHECK
    pub invitee_authority: UncheckedAccount<'info>,
    #[account(
        seeds=[
            b"USER_STATE",
            inviter_authority.key().as_ref(),
        ],
        bump,
    )]
    pub inviter: Account<'info, PlayerData>,
    #[account(
        seeds=[
            b"USER_STATE",
            invitee_authority.key().as_ref(),
        ],
        bump,
    )]
    pub invitee: Account<'info, PlayerData>,
    #[account(
        mut,
        realloc = 8 + std::mem::size_of::<InvitationsAccount>() + (invitations_account.invitations.len() + 1)*std::mem::size_of::<Invitation>(),
        realloc::payer = inviter_authority,
        realloc::zero = true,
        seeds=[
            b"INVITATION_STATE",
        ],
        bump
    )]
    pub invitations_account: Account<'info, InvitationsAccount>,
    #[account(
        init,
        payer=inviter_authority,
        space = 8 + GameData::INIT_SPACE,
        seeds = [
            b"GAME_STATE",
            invitations_account.key().as_ref(),
            invitations_account.invitations.len().to_string().as_bytes()
        ],
        bump
    )]
    pub game_account: Account<'info, GameData>,
}

#[derive(Accounts)]
#[instruction(invitation:Invitation)]
pub struct AcceptInvitaton<'info> {
    pub system_program: Program<'info, System>,
    /// CHECK
    pub inviter_authority: UncheckedAccount<'info>,
    #[account(mut)]
    pub invitee_authority: Signer<'info>,
    #[account(
        mut,
        seeds=[
            b"USER_STATE",
            inviter_authority.key().as_ref(),
        ],
        bump,
    )]
    pub inviter: Account<'info, PlayerData>,
    #[account(
        mut,
        seeds=[
            b"USER_STATE",
            invitee_authority.key().as_ref(),
        ],
        bump,
    )]
    pub invitee: Account<'info, PlayerData>,
    #[account(
        mut,
        seeds=[
            b"INVITATION_STATE"
        ],
        bump
    )]
    pub invitations_account: Account<'info, InvitationsAccount>,
    #[account(
        seeds = [
            b"GAME_STATE",
            invitations_account.key().as_ref(),
            invitation.index.to_string().as_bytes(),
        ],
        bump
    )]
    pub game_account: Account<'info, GameData>,
}

#[derive(Accounts)]
#[instruction(invitation:Invitation)]
pub struct MakeMove<'info> {
    #[account(mut)]
    pub player_authority: Signer<'info>,
    /// CHECK
    pub opponent_authority: UncheckedAccount<'info>,
    #[account(
        mut,
        seeds=[
            b"USER_STATE",
            player_authority.key().as_ref(),
        ],
        bump,
    )]
    pub player: Account<'info, PlayerData>,
    #[account(
        mut,
        seeds=[
            b"USER_STATE",
            opponent_authority.key().as_ref(),
        ],
        bump,
    )]
    pub opponent: Account<'info, PlayerData>,
    #[account(
        seeds=[
            b"INVITATION_STATE"
        ],
        bump
    )]
    pub invitations_account: Account<'info, InvitationsAccount>,
    #[account(
        mut,
        seeds = [
            b"GAME_STATE",
            invitations_account.key().as_ref(),
            invitation.index.to_string().as_bytes(),
        ],
        bump
    )]
    pub game_account: Account<'info, GameData>,
}
