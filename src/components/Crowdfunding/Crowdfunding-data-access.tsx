import { getCrowdfundingProgram, getCrowdfundingProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'

import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'

export function useCrowdfundingProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getCrowdfundingProgramId(cluster.network as Cluster), [cluster])
  const program = getCrowdfundingProgram(provider)

  const accounts = useQuery({
    queryKey: ['Crowdfunding', 'all', { cluster }],
    queryFn: () => program.account.Crowdfunding.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initialize = useMutation({
    mutationKey: ['Crowdfunding', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods.initialize().accounts({ Crowdfunding: keypair.publicKey }).signers([keypair]).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to initialize account'),
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
  }
}

export function useCrowdfundingProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useCrowdfundingProgram()

  const accountQuery = useQuery({
    queryKey: ['Crowdfunding', 'fetch', { cluster, account }],
    queryFn: () => program.account.Crowdfunding.fetch(account),
  })

  const closeMutation = useMutation({
    mutationKey: ['Crowdfunding', 'close', { cluster, account }],
    mutationFn: () => program.methods.close().accounts({ Crowdfunding: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accounts.refetch()
    },
  })

  const decrementMutation = useMutation({
    mutationKey: ['Crowdfunding', 'decrement', { cluster, account }],
    mutationFn: () => program.methods.decrement().accounts({ Crowdfunding: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const incrementMutation = useMutation({
    mutationKey: ['Crowdfunding', 'increment', { cluster, account }],
    mutationFn: () => program.methods.increment().accounts({ Crowdfunding: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const setMutation = useMutation({
    mutationKey: ['Crowdfunding', 'set', { cluster, account }],
    mutationFn: (value: number) => program.methods.set(value).accounts({ Crowdfunding: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  return {
    accountQuery,
    closeMutation,
    decrementMutation,
    incrementMutation,
    setMutation,
  }
}
