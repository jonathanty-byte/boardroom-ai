import { Composition } from "remotion";
import { DemoVideo } from "./DemoVideo";

export const Root: React.FC = () => {
  return (
    <Composition
      id="BoardroomDemo"
      component={DemoVideo}
      durationInFrames={60 * 30} // 60 seconds at 30fps
      fps={30}
      width={1280}
      height={720}
    />
  );
};
