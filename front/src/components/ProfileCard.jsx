import { useProfileMode } from "@/hooks/ChooseMood"; // ficticio

const ProfileCard = ({ username, bio, profilePicture, interest }) => {
    const { mode } = useProfileMode(); // ← mode: "couple" | "friendship"

    const isCouple = mode === "couple";
    const borderClass = isCouple ? "border-pink-500" : "border-blue-500";
    const badgeText = isCouple ? "Couple" : "Friendship";

    return (
        <Card className={`rounded-2xl shadow p-4 border-2 ${borderClass}`}>
            <img src={profilePicture} alt="Profile" className="rounded-xl w-full h-48 object-cover mb-4" />
            <div className="text-xl font-bold mb-1">{username}</div>
            <div className="text-sm text-muted-foreground mb-2">{interest}</div>
            <p className="text-sm mb-4">{bio}</p>
            <div className="text-xs font-medium px-2 py-1 bg-muted w-fit rounded">{badgeText} Profile</div>
        </Card>
    );
};