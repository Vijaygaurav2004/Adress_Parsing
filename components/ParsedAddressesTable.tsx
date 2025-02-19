import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { ParsedAddress } from "@/types"

interface ParsedAddressesTableProps {
  parsedAddresses: ParsedAddress[]
}

export default function ParsedAddressesTable({ parsedAddresses }: ParsedAddressesTableProps) {
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-gray-600">Society Name</TableHead>
            <TableHead className="text-gray-600">Block</TableHead>
            <TableHead className="text-gray-600">Flat</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parsedAddresses.map((address, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">
                {address.societyName}
              </TableCell>
              <TableCell>
                {address.block === null ? "N/A" : address.block}
              </TableCell>
              <TableCell>
                {address.flat === null ? "N/A" : address.flat}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

