import { ReactNode } from "react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "../ui/sidebar";
import { FilterIcon } from "lucide-react";
import { Separator } from "../ui/separator";

interface PageLayoutProps {
  title: string;
  sidebar: ReactNode;
  header?: ReactNode;
  pageContent: ReactNode | null;
  empty: ReactNode | null;
  footer?: ReactNode;
  loading: ReactNode | null;
}

function PageLayout({
  sidebar,
  title,
  header,
  footer,
  pageContent,
  empty,
  loading,
}: PageLayoutProps & React.ComponentProps<"div">) {
  return (
    <SidebarProvider>
      <div className="min-h-dvh flex w-full px-4">
        {sidebar}
        <SidebarInset className="flex-1 px-8">
          <header className="flex flex-col w-full px-4">
            <div className="flex justify-between items-center w-full mt-12 pb-3">
              <h1>{title}</h1>
              <div className="flex items-center gap-1">
                <SidebarTrigger className="h-8 w-8">
                  <FilterIcon />
                </SidebarTrigger>
                {header}
              </div>
            </div>
            <Separator className=" w-full" />
          </header>
          {pageContent && !loading && (
            <main className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] justify-between w-full gap-4 px-4 py-8">
              {pageContent}
            </main>
          )}
          {empty && !loading && (
            <main className="flex w-full my-auto content-center justify-center">
              {empty}
            </main>
          )}
          {loading && (
            <main className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] justify-between w-full gap-6 px-4 py-8">
              {loading}
            </main>
          )}
          <footer>{footer}</footer>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

export default PageLayout;
