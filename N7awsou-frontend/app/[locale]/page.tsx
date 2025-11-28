import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import LandingPageContent from "@/components/LandingPageContent";
import PageLayout from "@/components/layout/PageLayout";

export default function Home() {
    return (
        <PageLayout>
            <Navbar />
            <main className="flex-grow">
                <LandingPageContent />
            </main>
            <Footer />
        </PageLayout>
    );
}
