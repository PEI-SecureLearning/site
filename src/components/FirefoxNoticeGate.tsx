"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const FirefoxNotice = dynamic(() => import("@/components/FirefoxNotice"), {
    ssr: false,
});

export default function FirefoxNoticeGate() {
    const [isFirefox, setIsFirefox] = useState(false);

    useEffect(() => {
        setIsFirefox(/firefox/i.test(window.navigator.userAgent));
    }, []);

    return isFirefox ? <FirefoxNotice /> : null;
}
