import { produce } from "immer";
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


export function changeFirstExperienceOfSelectedPerson(p: Person[], selectedName: string, role: ExperienceRole): Person[] {
    return produce(p, darft => {
        const selectedPerson = darft.find(p => p.name === selectedName);
        if (selectedPerson) {
            selectedPerson.experience[0].role = role;
        }
    })
}