"use client"

import { useEffect, useState } from "react"

import { CONTRACT_ADDRESS } from "@/constants"
import { Card } from "@/components/Card"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import dinzukiElementalABI from "@/contracts/dinzuki-elemental-abi.json"
import { readContracts } from "wagmi/actions"
import toast, { Toaster } from "react-hot-toast"
import { useAccount, useContractWrite, useWaitForTransaction } from "wagmi"

interface TokenData {
  tokenId: number
  owner: string
  image: string
  name?: string
  title?: string
  animation_url?: string
  attributes?: object
}

const contractData = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].flatMap(
  (tokenId) => [
    {
      address: CONTRACT_ADDRESS,
      abi: dinzukiElementalABI,
      functionName: "tokenURI",
      args: [tokenId],
    },
    {
      address: CONTRACT_ADDRESS,
      abi: dinzukiElementalABI,
      functionName: "ownerOf",
      args: [tokenId],
    },
  ]
)

const notifySending = () => toast.loading("Transaction Sending!")
const notifyConfirmed = () => {
  toast.dismiss()
  toast.success("Transaction Confirmed!")
}

export default function Home() {
  const [tokenMaps, setTokenMaps] = useState<Record<string, TokenData[]>>({
    fire: [],
    water: [],
    waterAndFire: [],
  })

  const { write: immigrate, data: immigrateData } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: dinzukiElementalABI,
    functionName: "immigrate",
  })

  const {
    data,
    isLoading: isImmigrateLoading,
    isSuccess: isImmigrateSuccess,
  } = useWaitForTransaction({
    hash: immigrateData?.hash,
  })

  const handleImmigrateOnClick = (tokenId: number) => {
    immigrate({
      args: [tokenId],
    })
  }

  const fetchTokenInfos = async () => {
    const data = await readContracts({
      contracts: contractData as any,
    })

    let _tokenMaps: Record<string, TokenData[]> = {
      fire: [],
      water: [],
      waterAndFire: [],
    }
    const fetchRequests = []

    for (let i = 0; i < data.length; i += 2) {
      const tokenId = i / 2
      const { result: uri, status: uriStatus } = data[i]
      const { result: owner, status: ownerStatus } = data[i + 1]

      if (uriStatus !== "success" || ownerStatus !== "success") continue

      fetchRequests.push(
        fetch(String(uri))
          .then((res) => res.json())
          .then((respData) => {
            const nation = respData?.attributes?.find(
              ({ trait_type }: { trait_type: string }) =>
                trait_type === "Nation"
            )?.value

            const tokenInfo = { ...respData, owner, tokenId }

            if (nation === "Land of Fire") {
              _tokenMaps["fire"].push(tokenInfo)
            } else if (nation === "Land of Water") {
              _tokenMaps["water"].push(tokenInfo)
            } else if (nation === "Land of Water and Fire") {
              _tokenMaps["waterAndFire"].push(tokenInfo)
            }
          })
          .catch((e) => console.error("error", tokenId, e))
      )
    }

    await Promise.all(fetchRequests)

    setTokenMaps(_tokenMaps)
  }

  useEffect(() => {
    fetchTokenInfos()
  }, [])

  useEffect(() => {
    if (isImmigrateLoading) notifySending()
  }, [isImmigrateLoading])

  useEffect(() => {
    if (isImmigrateSuccess) {
      notifyConfirmed()
      setTimeout(() => fetchTokenInfos(), 3000)
    }
  }, [isImmigrateSuccess])

  return (
    <main className="p-3.5">
      <ConnectButton />

      {[
        { key: "fire", text: "Land Of Fire" },
        { key: "water", text: "Land Of Water" },
        { key: "waterAndFire", text: "Land Of Water And Fire" },
      ].map(({ key, text }) => (
        <div key={key} className="">
          <h2 className="text-xl">{text}</h2>
          <div className="flex gap-3 flex-col sm:flex-row">
            {tokenMaps[key]
              .sort((a, b) => a.tokenId - b.tokenId)
              .map(
                ({
                  tokenId,
                  image,
                  name,
                  title,
                  animation_url,
                  attributes,
                  owner,
                }) => (
                  <Card
                    key={tokenId}
                    tokenId={tokenId}
                    image={image}
                    name={name}
                    title={title}
                    animationUrl={animation_url}
                    attributes={attributes}
                    owner={owner}
                    onClick={handleImmigrateOnClick}
                  />
                )
              )}
          </div>
        </div>
      ))}
      <Toaster position="bottom-center" />
    </main>
  )
}
