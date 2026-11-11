import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { advisoryCommittee } from "./advisory";
import { internationalCommittee } from "./international";
import { managingCommittee } from "./managing";
import { nationalCommittee } from "./national";
import { regionalCommittee } from "./regional";

const committees = {
  managing: managingCommittee,
  advisory: advisoryCommittee,
  international: internationalCommittee,
  national: nationalCommittee,
  regional: regionalCommittee,
};

describe("committees", () => {
  test.each(Object.entries(committees))("every %s photo exists", (_, members) => {
    for (const member of members) {
      if (!member.image) continue;
      expect(existsSync(path.join("public", member.image)), member.image).toBe(true);
    }
  });

  test("the Managing Committee lists its officers first", () => {
    expect(managingCommittee.slice(0, 3).map(({ name, title }) => [name, title])).toEqual([
      ["Prof. Shaikh Mohammad Kais", "President"],
      ["Prof. Bibhuti Bhushan Malik", "Secretary"],
      ["Prof. Dilip Khairnar", "Treasurer"],
    ]);
    expect(managingCommittee).toHaveLength(12);
  });

  test("Prof. S. Gurusamy is on the Advisory Committee with a photo", () => {
    const member = advisoryCommittee.find(({ name }) => name === "Prof. S. Gurusamy");
    expect(member?.image).toBeDefined();
  });
});
