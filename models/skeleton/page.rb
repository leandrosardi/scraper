module BlackStack
    module Scraper
        class Page < Sequel::Model(:scr_page)
            many_to_one :order, :class=>:'BlackStack::Scraper::Order', :key=>:id_order
            
            # track the earnings to the user who scraped this page
            # update user.scraper_stat_total_earnings
            def track_earnings
                # TODO: Code Me!
            end

            # track a payout to a user
            # update user.scraper_stat_total_payouts
            def track_payout
                # TODO: Code Me!
            end

        end # class Page
    end # Scraper
end # BlackStack