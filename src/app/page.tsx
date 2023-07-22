"use client"

import { useEffect, useRef, useState } from "react"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { Card } from "@/components/Card"
import { CONTRACT_ADDRESS } from "@/constants"
import dinzukiElementalABI from "@/contracts/dinzuki-elemental-abi.json"
import { useAccount } from "wagmi"
import { readContracts } from "wagmi/actions"

interface TokenData {
  image: string
  name?: string
  title?: string
  animation_url?: string
  attributes?: object
}

// const dinzukiElementalContract: Record<string, any> = {
//   address: CONTRACT_ADDRESS,
//   abi: dinzukiElementalABI,
// }

const contractData = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(
  (tokenId) => ({
    address: CONTRACT_ADDRESS,
    abi: dinzukiElementalABI,
    functionName: "tokenURI",
    args: [tokenId],
  })
)

export default function Home() {
  const { address } = useAccount()
  const [tokenMaps, setTokenMaps] = useState<Record<string, TokenData[]>>({
    fire: [],
    water: [],
    waterAndFire: [],
  })

  useEffect(() => {
    const fetchTokenInfos = async () => {
      const data = await readContracts({
        contracts: contractData as any,
      })

      let _tokenMaps: Record<string, TokenData[]> = {
        fire: [],
        water: [],
        waterAndFire: [],
      }

      for (const { result, status } of data) {
        if (status === "success") {
          fetch(String(result))
            .then((res) => res.json())
            .then((respData) => {
              const nation = respData?.attributes?.find(
                ({ trait_type }: { trait_type: string }) =>
                  trait_type === "Nation"
              )?.value
              if (nation === "Land of Fire") {
                _tokenMaps["fire"].push(respData)
              } else if (nation === "Land of Water") {
                _tokenMaps["water"].push(respData)
              } else if (nation === "Land of Water and Fire") {
                _tokenMaps["waterAndFire"].push(respData)
              }
            })
        }
      }

      setTokenMaps(_tokenMaps)
    }

    fetchTokenInfos()
  }, [])

  return (
    <main className="p-3.5">
      <ConnectButton />
      <br />

      {[
        { key: "fire", text: "Land Of Fire" },
        { key: "water", text: "Land Of Water" },
        { key: "waterAndFire", text: "Land Of Water And Fire" },
      ].map(({ key, text }) => (
        <>
          <h2 className="text-xl">{text}</h2>
          <div className="flex gap-3">
            {tokenMaps[key].map(
              ({ image, name, title, animation_url, attributes }, index) => (
                <Card
                  key={index}
                  image={image}
                  name={name}
                  title={title}
                  animationUrl={animation_url}
                  attributes={attributes}
                />
              )
            )}
          </div>
        </>
      ))}
    </main>
  )
}
