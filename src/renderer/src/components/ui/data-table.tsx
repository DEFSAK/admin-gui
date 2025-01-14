import {
  ColumnDef,
  flexRender,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { useEffect, useState } from 'react'
import { statusMap } from '@/lib/api'
import { Button } from './button'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  requestFailed: boolean
  requestStatus: number
}

export function DataTable<TData, TValue>({
  columns,
  data,
  requestFailed,
  requestStatus
}: DataTableProps<TData, TValue>) {
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [data])

  const paginatedData = data.slice((page - 1) * 5, page * 5)

  const table = useReactTable({
    data: paginatedData,
    columns,
    pageCount: Math.min(Math.max(1, Math.ceil(data.length / 5))),
    rowCount: 5,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination: {
        pageIndex: page - 1,
        pageSize: 5
      }
    }
  })

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {requestFailed ? (
                    <span className="text-red-400">{statusMap[requestStatus.toString()]}</span>
                  ) : (
                    'No Results.'
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-row items-center justify-between py-4">
        <div>
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </div>
        <div>
          <Button
            className="rounded-r-none"
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            className="rounded-l-none"
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  )
}
