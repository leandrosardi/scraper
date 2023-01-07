module BlackStack
    module Scraper
        class Page < Sequel::Model(:scr_page)
            many_to_one :order, :class=>:'BlackStack::Scraper::Order', :key=>:id_order
            
            # if a page is not uploaded in 15 minutes, then it is considered as abandoned.
            # abandoned means: the user is not longer active, or something happened.
            MAX_MINUTES_TO_WAIT_FOR_UPLOAD = 15

            # trigger
            def after_update
                super
                self.apply_earnings
            end

            # trigger
            def after_create
                super
                self.apply_earnings
            end
            
            # find pages assigned (`upload_reservation_id`), 
            # 5 minutes ago (`upload_reservation_time`) or 
            # earlier, but not finished yet (`upload_end_time`).
            #
            # TODO: 5 minutes is hardcoded. It should be a parameter, depending on the user's stealth configuration.
            # 
            def self.abandoned(limit=-1)
                ret = []
                # build the query
                q = "
                select p.id
                from scr_page p
                where
                    upload_reservation_id is not null and
                    upload_reservation_time < cast('#{now}' as timestamp) - interval '#{MAX_MINUTES_TO_WAIT_FOR_UPLOAD.to_s} minutes' and
                    upload_end_time is null
                "
                q += "limit #{limit}" if limit > 0
                # load the object
                DB[q].all { |r|
                    ret << BlackStack::Scraper::Page.select(:id, :number, :id_order).where(:id=>r[:id]).first
                    # release resources
                    GC.start
                    DB.disconnect
                }
                # return
                ret
            end

            # reset upload reservation flags
            def relaunch()
                DB.execute("UPDATE scr_page SET upload_reservation_id = NULL, upload_reservation_time = NULL, upload_start_time = NULL, upload_end_time = NULL WHERE id = '#{self.id}'")
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
            def apply_earnings
                # page must have been uplaoded and parsed successfully
                return if self.upload_success.nil? || self.upload_success == false
                return if self.parse_success.nil? || self.parse_success == false
                # get the users
                user_owner = self.order.user
                user_agent = BlackStack::Scraper::Assignation.where(:id_page=>self.id).order(:create_time).last.user 
                # user owner and agent must be belonging different accounts
                return if user_owner.id_account.to_guid == user_agent.id_account.to_guid
                # must not be an earning already registered for this page
                earning = BlackStack::Scraper::Movement.where(:id_page=>self.id).first
                # apply the earnings
                if earning.nil?
                    m = BlackStack::Scraper::Movement.new
                    m.id = guid
                    m.create_time = now
                    m.id_page = self.id
                    m.id_user = user_agent.id
                    m.type = BlackStack::Scraper::Movement::TYPE_EARNING
                    m.amount = user_agent.scraper_ppp
                    m.save
                end
                # update the user stats
                user_agent.update_stats
            end

            # track a payout to a user
            # update user.scraper_stat_total_payouts
            def track_payout
                # TODO: Code Me!
            end

        end # class Page
    end # Scraper
end # BlackStack