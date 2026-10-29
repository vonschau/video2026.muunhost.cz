import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { tie } from "@/lib/tie";

export function Tied({ children }: { children: ReactNode }) {
  return <>{tieTree(children)}</>;
}

function tieTree(node: ReactNode): ReactNode {
  if (typeof node === "string") return tie(node);
  if (!isValidElement(node)) return node;

  const element = node as ReactElement<{ children?: ReactNode }>;
  if (element.props.children == null) return node;

  return cloneElement(element, {
    children: Children.map(element.props.children, (child) => tieTree(child)),
  });
}
