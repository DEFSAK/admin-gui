import ConsoleKeySettings from "../settings/console-key";
import Credits from "../settings/credits";

function Settings() {
    return (
        <div className="flex flex-col gap-2 mx-10">
            <ConsoleKeySettings />
            <Credits />
        </div>
    )
}

export default Settings;