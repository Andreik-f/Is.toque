import test from "node:test";
import assert from "node:assert/strict";
import { MAX_IMAGE_BYTES, imageFileError } from "./image-file.js";

test("aceita JPG, PNG e WebP de até 5 MB", () => {
  for (const type of ["image/jpeg", "image/png", "image/webp"])
    assert.equal(imageFileError({ type, size: 1000 }), "");
  assert.equal(
    imageFileError({ type: "image/png", size: MAX_IMAGE_BYTES }),
    "",
  );
});

test("recusa outro formato e arquivo acima de 5 MB", () => {
  assert.match(imageFileError({ type: "image/gif", size: 1000 }), /Formato/);
  assert.match(
    imageFileError({ type: "image/png", size: MAX_IMAGE_BYTES + 1 }),
    /5 MB/,
  );
});
