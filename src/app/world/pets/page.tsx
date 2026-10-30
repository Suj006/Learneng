import { requireChild } from "@/server/session";
import { petsState } from "@/server/world";
import { PageTitle } from "@/components/ui";
import { PetsClient } from "./PetsClient";

export const metadata = { title: "Pet Companions" };
export default async function Pets() {
  const child = await requireChild();
  return <><PageTitle title="🐾 Pet Companions" subtitle="Pets join you when you reach learning goals, and grow as you learn. They never get sad or hungry — they're always happy to see you!" /><PetsClient pets={await petsState(child.id)} /></>;
}
