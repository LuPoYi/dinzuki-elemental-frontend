import { OPENSEA_URL } from '@/constants';
import { useAccount } from 'wagmi';

interface CardProps {
  tokenId: number
  image: string
  name?: string
  title?: string
  animationUrl?: string
  attributes?: any
  owner: string
  onClick: (tokenId: number) => void
}

export function Card({
  tokenId,
  image,
  name,
  title,
  animationUrl,
  attributes,
  owner,
  onClick,
}: CardProps) {
  const { address } = useAccount()
  const isOwner = owner === address

  return (
    <div className="card w-full sm:w-72 bg-base-100 shadow-xl">
      <a
        href={`${OPENSEA_URL}/${tokenId}`}
        rel="noopener noreferrer"
        target="_blank"
      >
        <figure>
          <img src={image} alt="nft" />
        </figure>{" "}
      </a>

      <div className="card-body">
        <h2 className="card-title">{name}</h2>

        {isOwner && (
          <div className="card-actions justify-end">
            <button
              className="btn btn-primary"
              onClick={() => onClick(tokenId)}
            >
              Immigrate
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
