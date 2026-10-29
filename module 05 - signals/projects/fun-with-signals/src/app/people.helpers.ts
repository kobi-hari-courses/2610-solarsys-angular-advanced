import { ExperienceRole, Person } from "./models";
import { changeItem } from "./utils/immutables";

export function changePersonExperience(p: Person, index: number, role: ExperienceRole): Person {
    return {
        ...p, 
        experience: changeItem(
            p.experience,
            (e, i) => i === index,
            (_) => ({ role }),
        ),
    }
}

export function selectByName(selectedName: string): (p: Person) => boolean {
    return (p: Person) => p.name === selectedName;
}