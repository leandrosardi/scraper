module BlackStack
    module Scraper
        class Page < Sequel::Model(:scr_page)
            many_to_one :order, :class=>:'BlackStack::Scraper::Order', :key=>:id_order
            
            # get the pages pending for visit/upload, with a try time lower than 5.
            def self.pendings(limit=-1, max_tries=5)
                # get `batch_size` pages pending for upload
                ret = BlackStack::DfyLeads::Page.where("coalesce(upload_success,false)=false and coalesce(upload_reservation_times,0)<#{max_tries}")
                ret = ret.limit(limit) if limit > 0
                ret.all 
            end

            # assign this page to a user
            def assign(user)
                # TODO: Code Me!
            end

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