import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ArrowDownUp, ArrowUpDown, Search, Plus } from "lucide-react";
import { useState } from "react";
import { tasksColumns } from "@/components/ui/table/columns";
import data from "../../mock_tasks.json";
import { DataTable } from "@/components/ui/table/data-table";
import { TaskT } from "../../types";
import TaskDialog from "@/components/forms/task-dialog";

function Aufgaben() {
    const [searchInput, setSearchInput] = useState("");
    const [isFlipped, setIsFlipped] = useState(false);
    const [sortBy, setSortBy] = useState("date");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<TaskT | null>(null);

    const tasks = data as TaskT[];
    const columns = tasksColumns as { header: string; accessorKey: string }[];

    const headerValue = () => {
        // Find the corresponding header value
        const column = columns.find((column) => column.accessorKey === sortBy);
        const headerValue = column ? column.header : "";
        return headerValue;
    };

    const onRowClick = (task: TaskT) => {
        setSelectedTask(task);
        setIsDialogOpen(true);
    };

    const filteredItems = useMemo(() => {
        if (tasks) {
            const sorted = tasks.sort((a, b) => {
                switch (sortBy) {
                    case "date":
                        // Sort by date, newest first
                        const dateA = a.date.split("-").reverse().join("-");
                        const dateB = b.date.split("-").reverse().join("-");
                        return (
                            new Date(dateB).getTime() -
                            new Date(dateA).getTime()
                        );

                    case "deadline":
                        // sort by deadline, oldest first
                        const date1 = a.deadline.split("-").reverse().join("-");
                        const date2 = b.deadline.split("-").reverse().join("-");
                        return (
                            new Date(date2).getTime() -
                            new Date(date1).getTime()
                        );

                    case "done":
                        // Sort by done tasks
                        return a.done === b.done ? 0 : a.done ? 1 : -1;

                    case "priority":
                        // Sort by priority, highest first
                        const priorityOrder = { low: 0, medium: 1, high: 2 };
                        return (
                            priorityOrder[b.priority] -
                            priorityOrder[a.priority]
                        );

                    case "title":
                    case "content":
                        // Sort by title and content alphabetically
                        return a[sortBy].localeCompare(b[sortBy]);

                    default:
                        return 0;
                }
            });

            // Filter by searchInput
            const words = searchInput.trim().toLowerCase().split(/\s+/);

            const filteredItems = words.reduce((results, word) => {
                return results.filter(
                    (item) =>
                        item.title.toLowerCase().includes(word) ||
                        item.content.toLowerCase().includes(word) ||
                        item.date.toLowerCase().includes(word) ||
                        item.deadline.toLowerCase().includes(word)
                );
            }, sorted);

            // Control the flip button
            const flipped = isFlipped ? filteredItems.reverse() : filteredItems;

            return flipped;
        } else return null;
    }, [tasks, sortBy, searchInput, isFlipped]);

    const rowOnClick = (task: TaskT) => {
        setIsDialogOpen(true);
    };

    return (
        <main className="grid grid-cols-1 h-full mt-12 md:mt-16 lg:ml-24 md:px-5">
            <section className="mb-5">
                <Card className="border-none shadow-none">
                    <CardHeader>
                        <CardTitle>Aufgaben</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 md:px-6">
                        <div className="mt-5 mb-4 flex w-full justify-between flex-wrap space-y-4 md:space-y-0">
                            <Input
                                placeholder="Suchen..."
                                onChange={(event) =>
                                    setSearchInput(event.target.value)
                                }
                                className="w-48"
                                icon={<Search className="mx-2 h-4 w-4" />}
                            />
                            <div className="flex gap-3 flex-wrap">
                                <Button
                                    onClick={() => setIsFlipped(!isFlipped)}
                                    variant="outline"
                                    className="h-9 md:h-8">
                                    {isFlipped ? (
                                        <ArrowDownUp className="h-4 w-4" />
                                    ) : (
                                        <ArrowUpDown className="h-4 w-4" />
                                    )}
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            className="h-9 md:h-8"
                                            variant="outline">
                                            Sortiert nach:{" "}
                                            <b className="ml-1">
                                                {headerValue()}
                                            </b>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-48">
                                        <DropdownMenuRadioGroup
                                            value={sortBy}
                                            onValueChange={setSortBy}>
                                            {columns
                                                .filter(
                                                    (column) =>
                                                        column.accessorKey
                                                )
                                                .map((column) => (
                                                    <DropdownMenuRadioItem
                                                        key={column.accessorKey}
                                                        value={
                                                            column.accessorKey
                                                        }>
                                                        {column.header}]{" "}
                                                    </DropdownMenuRadioItem>
                                                ))}
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <Button
                                    onClick={() => setIsDialogOpen(true)}
                                    variant={"outline"}>
                                    <Plus className="h-4 w-4 mr-1" />
                                    Aufgabe hinzufügen
                                </Button>
                            </div>
                        </div>
                        {filteredItems && (
                            <DataTable
                                data={filteredItems}
                                columns={tasksColumns}
                            />
                        )}
                    </CardContent>
                </Card>
            </section>
            <TaskDialog open={isDialogOpen} setOpen={setIsDialogOpen} />
        </main>
    );
}

export default Aufgaben;
