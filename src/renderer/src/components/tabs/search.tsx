import { Form, FormControl, FormField, FormItem, FormMessage } from "../ui/form";
import { columns, TableColumns } from "../search-table/columns";
import { FloatingLabelInput } from "../ui/floating-input";
import { truncateAliasHistory } from "@/lib/api";
import { DataTable } from "../ui/data-table";
import { createForm } from "@/lib/forms";
import { useAPI } from "../api-provider";
import RateLimit from "../rate-limit";
import { Button } from "../ui/button";
import ComboBox from "../ui/combobox";
import { useState } from "react";
import { z } from "zod";

const SearchSchema = z.object({
    search: z.string().min(1, {
        message: "Search query is required"
    })
})

function Search() {
    const [tableData, setTableData] = useState<TableColumns[]>([]);
    const [label, setLabel] = useState<string>("Name");
    const [failedRequest, setFailedRequest] = useState(false);
    const [requestStatus, setRequestStatus] = useState<number>(0);
    const form = createForm(SearchSchema);
    const { api } = useAPI();

    function ProcessTableData(data: PlayFabDetails, search_term?: string): TableColumns {
        const player = data as TableColumns;
        const aliasHistory = player.aliasHistory.split(',');
        player.current_name = aliasHistory[aliasHistory.length - 1];

        const truncated = truncateAliasHistory(player.aliasHistory, search_term ? search_term : player.current_name);
        if (typeof truncated === "string") {
            player.truncated_aliasHistory = truncated;
        } else {
            player.truncated_aliasHistory = truncated.truncatedAliasHistory;
        }

        return player
    }

    function handleResponse<T>(res: APIResponse<T>, onSuccess: (data: T) => void) {
        if (res) {
            if (res.status === 200) {
                onSuccess(res.data);
                setFailedRequest(false);
            } else {
                setFailedRequest(true);
                setTableData([]);
            }

            setRequestStatus(res.status);
        } else {
            setFailedRequest(true);
            setRequestStatus(-1);
            setTableData([]);
        }
    }

    function onSubmit(data: z.infer<typeof SearchSchema>) {
        const search = data.search;

        if (label === "Name") {
            api.nameLookup(search, 0).then((res) => {
                handleResponse(res, (data) => {
                    setTableData(data.players.map((player) => ProcessTableData(player, search)));
                })
            })
        } else if (label === "PlayFab ID") {
            api.fetchPlayFabData(search).then((res) => {
                handleResponse(res, (data) => {
                    setTableData([ProcessTableData(data)] as TableColumns[])
                })
            })
        }
    }

    return (
        <div className="mx-10">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex justify-between mb-2">
                    <div className="flex flex-row">
                        <FormField control={form.control} name="search" render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <FloatingLabelInput {...field} label="Search by" className="rounded-r-none" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <ComboBox options={['Name', 'PlayFab ID']} className="rounded-l-none" onChange={(value) => setLabel(value)} />
                    </div>
                    <Button type="submit" variant="outline" className="ml-2">Search</Button>
                </form>
                <div>
                    <DataTable columns={columns} data={tableData} requestFailed={failedRequest} requestStatus={requestStatus} />
                </div>
            </Form>
            <div className="mt-2 flex justify-center">
                <RateLimit />
            </div>
        </div>
    )
}

export default Search;