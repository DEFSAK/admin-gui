import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import verData from '../assets/version.json';
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useState } from "react";
import Tabs from "@/lib/tabs";
interface AppSidebarProps {
    onTabChange: (title: string) => void;
}

function AppSidebar({ onTabChange }: AppSidebarProps) {
    const [activeTab, setActiveTab] = useState<string>("Dashboard");

    return (
        <Sidebar>
            <SidebarHeader>
                <div className="flex flex-col items-center justify-center overflow-hidden rounded-md">
                    <h1 className="font-bold text-center text-white relative z-20">
                        DEFSAK
                    </h1>
                    <div className="w-[8rem] h-2 relative">
                        <div className="absolute inset-x-4 -top-1.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-3/4 blur-sm" />
                        <div className="absolute inset-x-4 -top-1.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-3/4" />
                        <div className="absolute inset-x-12 -top-1.5 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] w-1/4 blur-sm" />
                        <div className="absolute inset-x-12 -top-1.5 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px w-1/4" />
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {Tabs.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        isActive={item.title === activeTab}
                                        className="cursor-pointer"
                                        onClick={() => {
                                            onTabChange(item.title)
                                            setActiveTab(item.title)
                                        }}
                                        asChild
                                    >
                                        <div>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </div>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <Popover>
                    <PopoverTrigger asChild>
                        <div className="flex items-center justify-center">
                            <Button variant="link" size="xs" className="text-muted-foreground">Developer Info</Button>
                        </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-fit">
                        <div className="flex flex-col gap-1">
                            <div className="flex flex-row gap-2">
                                Version
                                <Badge className="select-all">{verData.version}</Badge>
                            </div>
                            <div className="flex flex-row gap-2">
                                Branch
                                <Badge className="select-all">{verData.branch}</Badge>
                            </div>
                            <div className="flex flex-row gap-2">
                                Commit Hash
                                <Badge className="select-all">{verData["commit hash"]}</Badge>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </SidebarFooter>
        </Sidebar>
    )
}

export default AppSidebar;