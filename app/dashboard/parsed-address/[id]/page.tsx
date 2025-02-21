import { Suspense } from "react"
import ParsedAddressClient from "./ParsedAddressClient"

interface PageProps {
  params: {
    id: string
  }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function ParsedAddressPage({ params }: PageProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ParsedAddressClient id={params.id} />
    </Suspense>
  )
}
