module BlackStack
    module Scraper
        class Page < Sequel::Model(:scr_page)
            many_to_one :order, :class=>:'BlackStack::Scraper::Order', :key=>:id_order
            
            # get the pages with an URL assigned 
            # and pending for visit/upload, with 
            # a try time lower than 5.
            def self.pendings(limit=-1, max_tries=5)
                ret = []
                # build the query
                q = "
                select p.id
                from scr_page p
                join scr_order o on (o.id=p.id_order and o.url is not null)
                where
                    coalesce(upload_success,false)=false and 
                    coalesce(upload_reservation_times,0)<5
                "
                q += "limit #{limit}" if limit > 0                
                # load the object
                DB[q].all { |r| 
                    ret << BlackStack::DfyLeads::Page.where(:id=>r[:id]).first
                    # release resources
                    GC.start
                    DB.disconnect
                }
                # return
                ret
            end

            # assign this page to a user
            def assign(user)
                # track the assignation
                user.track_assignation(self)
                # assign
                self.upload_reservation_id = user.email
                self.upload_reservation_time = now
                self.upload_reservation_times = self.upload_reservation_times.to_i + 1
                self.save
            end

            # get the page url, based on the url of the order and the page number
            def url
                # get the order
                o = self.order
                # get the url
                url = o.url
                return nil if url.nil?
                # get hash of parameters
                uri = URI.parse(url)
                query = uri.query
                params = query.nil? ? {} : CGI.parse(uri.query)
                # remove the `page` parameter from the url
                params.reject! { |k,v| k.downcase == 'page' }
                # add page parameter
                params['page'] = self.number.to_s
                # rebuild the query string
                uri.query = URI.encode_www_form(params)
                # return the url
                uri.to_s
            end # def url
            
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