import { ChallengePlayer } from "@/components/play/ChallengePlayer";
import { PageTitle } from "@/components/ui";

export const metadata = { title: "Listening Lab" };
export default function Listening() {
  return <><PageTitle title="Listening Lab" subtitle="Turn your sound on. Listen, then choose!" /><ChallengePlayer kind="listening" guide="speaky" /></>;
}
