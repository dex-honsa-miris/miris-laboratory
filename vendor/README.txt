Miris Web SDK — local build
===========================
version : 0.0.9-budget-lab.28ccca1
source  : Miris-Inc/aqua PR #5982 (markojagodic/budget-lab)
commit  : 28ccca17ccac1961919db1d36eb6c29f58cfcbb0
built   : 2026-09-08, production env
          WASM rebuilt from this commit (emsdk 4.0.14); AquaApi.wasm in the
          core tarball is byte-identical to the freshly linked binary.

Install (order matters — three and components peer-depend on core at this
exact version):

  npm install ./miris-inc-core-0.0.9-budget-lab.28ccca1.tgz \
              ./miris-inc-three-0.0.9-budget-lab.28ccca1.tgz \
              ./miris-inc-components-0.0.9-budget-lab.28ccca1.tgz

three is a peer dependency (>=0.182.0 <0.186.0) and is not bundled.
No sourcemaps and no shark/webshark WASM are included.

NOTE: this is NOT a drop-in for the bolt workshop, which pins
0.0.8-1238406 from npm. The FIT_OVERRIDES placement numbers in
miris/config.ts were measured against that version and would need
re-measuring.
