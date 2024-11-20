import ConsoleKeySettings from "../settings/console-key";
import Container from "../container";

function Settings() {
    return (
        <Container>
            <div className="flex flex-col gap-2 w-full h-[calc(100vh_-_105px)]">
                <ConsoleKeySettings />
            </div>
        </Container>
    )
}

export default Settings;