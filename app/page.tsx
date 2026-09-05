import { requireChatGPTUser } from "./chatgpt-auth";
import CoachApp from "./coach-app";

export const dynamic = "force-dynamic";

const OWNER_USER_ID = "e0144aef-516f-4629-92f4-0dad48ff2694";

export default async function Home() {
  const user = await requireChatGPTUser("/");

  return (
    <CoachApp
      viewer={{
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        isOwner: user.id === OWNER_USER_ID,
      }}
    />
  );
}
