import {forwardRef, type ReactElement, type Ref} from "react";
import {Slide, type SlideProps} from "@mui/material";

export const Transition = forwardRef(function Transition(
    props: SlideProps & { children: ReactElement<unknown> },
    ref: Ref<unknown>
) {
    return <Slide direction="up" ref={ref} {...props} />;
});