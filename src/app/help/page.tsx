// src/app/help/page.tsx
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"; //
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function HelpPage() {
  return (
      <div className="container mx-auto px-4 py-8">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Help Center</h1>

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>
              Find answers to common questions about VideoTube.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* You might need to add shadcn/ui accordion component if it's not present:
                npx shadcn-ui@latest add accordion
            */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>How do I upload a video?</AccordionTrigger>
                <AccordionContent>
                  You can upload a video by clicking the &quot;Upload&quot; button in the
                  header and filling out the video details form. Make sure to
                  include a title, description, video file, and thumbnail image.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>How do I search for videos?</AccordionTrigger>
                <AccordionContent>
                  Use the search bar at the top of the page. Type in keywords
                  related to the video you&#39;re looking for and press Enter or
                  click the search icon.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>
                  How can I subscribe to a channel?
                </AccordionTrigger>
                <AccordionContent>
                  You can subscribe to a channel by visiting their channel page
                  and clicking the &quot;Subscribe&quot; button. You must be logged in to
                  subscribe.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>What is watch history?</AccordionTrigger>
                <AccordionContent>
                  Your watch history keeps track of all the videos you&#39;ve
                  viewed. You can access it from the sidebar under &quot;Library&quot;.
                  You can also clear your watch history from that page.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger>
                  How do I change my profile settings?
                </AccordionTrigger>
                <AccordionContent>
                  You can manage your account settings, including profile
                  information and preferences, by navigating to the &quot;Settings&quot;
                  page from the sidebar or your user dropdown menu in the
                  header.
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="mt-8 text-center text-muted-foreground">
              <p>Still need help? Please contact our support team.</p>
              <p className="mt-2 text-primary">support@videotube.com</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
