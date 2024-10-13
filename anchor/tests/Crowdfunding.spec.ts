import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair} from '@solana/web3.js'
import {Crowdfunding} from '../target/types/Crowdfunding'
import '@types/jest';

describe('Crowdfunding', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.Crowdfunding as Program<Crowdfunding>

  const CrowdfundingKeypair = Keypair.generate()

  it('Initialize Crowdfunding', async () => {
    await program.methods
      .initialize()
      .accounts({
        Crowdfunding: CrowdfundingKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([CrowdfundingKeypair])
      .rpc()

    const currentCount = await program.account.Crowdfunding.fetch(CrowdfundingKeypair.publicKey)

    expect(currentCount.count).toEqual(0)
  })

  it('Increment Crowdfunding', async () => {
    await program.methods.increment().accounts({ Crowdfunding: CrowdfundingKeypair.publicKey }).rpc()

    const currentCount = await program.account.Crowdfunding.fetch(CrowdfundingKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Increment Crowdfunding Again', async () => {
    await program.methods.increment().accounts({ Crowdfunding: CrowdfundingKeypair.publicKey }).rpc()

    const currentCount = await program.account.Crowdfunding.fetch(CrowdfundingKeypair.publicKey)

    expect(currentCount.count).toEqual(2)
  })

  it('Decrement Crowdfunding', async () => {
    await program.methods.decrement().accounts({ Crowdfunding: CrowdfundingKeypair.publicKey }).rpc()

    const currentCount = await program.account.Crowdfunding.fetch(CrowdfundingKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Set Crowdfunding value', async () => {
    await program.methods.set(42).accounts({ Crowdfunding: CrowdfundingKeypair.publicKey }).rpc()

    const currentCount = await program.account.Crowdfunding.fetch(CrowdfundingKeypair.publicKey)

    expect(currentCount.count).toEqual(42)
  })

  it('Set close the Crowdfunding account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        Crowdfunding: CrowdfundingKeypair.publicKey,
      })
      .rpc()

    // The account should no longer exist, returning null.
    const userAccount = await program.account.Crowdfunding.fetchNullable(CrowdfundingKeypair.publicKey)
    expect(userAccount).toBeNull()
  })
})
