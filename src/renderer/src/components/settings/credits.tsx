import { useEffect, useState } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import ShineBorder from "../ui/shine-border";
import SparklesText from "../ui/sparkles-text";

function Credits() {
    const [contributors, setContributors] = useState<Contributor[]>([])

    useEffect(() => {
        window.electron.ipcRenderer.invoke('fetch_contributors').then((contributors: Contributor[]) => {
            setContributors(contributors)
        })
    }, [])

    return (
        <div className="flex flex-col items-center justify-center">
            <SparklesText text="Contributors" className="text-2xl font-bold" />
            <div className="flex justify-center items-center">
                <ScrollArea className="h-96 w-full">
                    <div className="flex flex-col gap-2">
                        {contributors.map((contributor) => {
                            const name = contributor.login;
                            const avatar = contributor.avatar_url;
                            const url = contributor.html_url;
                            const contributions = contributor.contributions;

                            return (
                                <ShineBorder color="white" key={name} className="flex items-center bg-card border border-border p-2">
                                    <Avatar>
                                        <AvatarImage src={avatar} alt={name} />
                                        <AvatarFallback>{name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="ml-4">
                                        <a href={url} target="_blank" rel="noreferrer">
                                            <h1 className="text-lg text-foreground underline">{name}</h1>
                                        </a>
                                        <p className="text-sm text-muted-foreground">{contributions} contributions</p>
                                    </div>
                                </ShineBorder>
                            )
                        })}
                    </div>
                </ScrollArea>
            </div>
        </div>
    )
}

export default Credits;