import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import StatDialog from '../dialogs/stats';

export interface TableColumns extends PlayFabDetails {
    current_name: string;
    truncated_aliasHistory: string;
    displayName?: string;
}

export const columns: ColumnDef<TableColumns>[] = [
    {
        accessorKey: "current_name",
        header: "Name",
    },
    {
        accessorKey: "truncated_aliasHistory",
        header: "Alias History",
        cell: ({ row }) => {
            return (
                <div className="max-w-[300px] truncate">
                    {row.original.truncated_aliasHistory}
                </div>
            )
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const player = row.original;
            player.displayName = player.current_name;

            return (
                <div className="flex flex-row">
                    <Dialog>

                        <DialogTrigger asChild>

                            <Button size="xs" variant="ghost" className="btn btn-primary">
                                View Details
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <StatDialog player={player as Player} data={player} />
                        </DialogContent>
                    </Dialog>
                </div>
            )
        }
    }
]