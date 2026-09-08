// A finished CRT frame belongs to one painted record, including its edits.
export function terminalFrames() {
  let frame = null;
  return {
    get(source, owner) {
      return frame?.source === source && frame.owner === owner ? frame.texture : null;
    },
    commit(texture, source, owner) { frame = { texture, source, owner }; },
    clear() { frame = null; },
  };
}
