import { createRoot } from "react-dom/client";
import Stage from "./stage";
import MirisGuide from "../miris/Guide";
import StageBoundary from "../miris/StageBoundary";
import ReferenceStage from "../miris/stage.reference";

const reference = new URLSearchParams(location.search).get('view') === 'reference';

createRoot(document.getElementById("root")!).render(
  <>
    <StageBoundary>
      {reference ? <ReferenceStage /> : <Stage />}
    </StageBoundary>
    {reference ? <a href="/" className="mw-reference-return">Reference laboratory · Back to my build</a> : <MirisGuide />}
  </>,
);
