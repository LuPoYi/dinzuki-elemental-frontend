interface CardProps {
  image: string
  name?: string
  title?: string
  animationUrl?: string
  attributes?: any
}

export function Card({
  image,
  name,
  title,
  animationUrl,
  attributes,
}: CardProps) {
  return (
    <div className="card w-72 bg-base-100 shadow-xl">
      <figure>
        <img src={image} alt="nft" />
      </figure>

      <div className="card-body">
        <h2 className="card-title">{name}</h2>

        {/* <p>{JSON.stringify(attributes)}</p> */}
        {/* <div className="card-actions justify-end">
          <button className="btn btn-primary">Buy Now</button>
        </div> */}
      </div>
    </div>
  )
}
