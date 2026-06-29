"use client";
export default function Error({error,reset}:{error:Error;reset:()=>void}){return <main className="shell"><section className="panel pageHeader"><p className="eyebrow">Page error</p><h1>Something needs attention.</h1><p>{error.message}</p><button className="button primary" onClick={reset}>Try again</button></section></main>}
