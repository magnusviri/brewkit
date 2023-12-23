import {
  assertEquals,
  assertNotEquals,
  assertArrayIncludes,
  assert,
} from "deno/testing/asserts.ts";
import { _parse } from "./usePantry.getVersions.ts";
import { SemVer } from "libpkgx";

Deno.test("versions array", async () => {
  const foo = await _parse([3, "1.2.3", "v2.3.4"]);
  assert(foo[0].eq(new SemVer("3.0.0")));
  assert(foo[1].eq(new SemVer("1.2.3")));
  assert(foo[2].eq(new SemVer("2.3.4")));
  assertEquals(foo.length, 3);
});

Deno.test("single version", async () => {
  const foo = await _parse("3");
  assert(foo[0].eq(new SemVer("3.0.0")));
  assertEquals(foo.length, 1);
});

Deno.test("complex versions", async () => {
  const foo = await _parse([
    {
      github: "rust-lang/rls/tags",
    },
    "1.0.1",
    "1.0.2",
  ]);
  assert(foo[0].eq(new SemVer("0.125.0"))); // First RLS version
  assert(foo[foo.length - 3].eq(new SemVer("1.39.0"))); // RLS is no longer maintained and v1.39.0 is the last version available
  assert(foo[foo.length - 2].eq(new SemVer("1.0.1")));
  assert(foo[foo.length - 1].eq(new SemVer("1.0.2")));
});

Deno.test("npm versions", async () => {
  const versions = await _parse([
    {
      npm: "nx",
      ignore: ["9999.0.1", "999.9.9"],
    },
  ]);
  assertEquals(versions[0], new SemVer("0.7.3"));
  assert(
    versions.filter((v) => v.eq(new SemVer("999.0.1"))).length === 0,
    "999.0.1 should be filtered out",
  );
  assert(
    versions.filter((v) => v.eq(new SemVer("9999.0.1"))).length === 0,
    "9999.0.1 should be filtered out",
  );
});
