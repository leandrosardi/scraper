module BlackStack
    module Scraper
        # inherit from BlackStack::MySaaS::User
        class User < BlackStack::MySaaS::User
            # array of orders
            one_to_many :orders, :class=>:'BlackStack::Scraper::Order', :key=>:id_user

            # return array of of BlackStack::Scraper::User objects 
            # who are running the extension right now, and who are
            # sharing their extension with other accounts.
            #
            # if limit > 0, return only the first `limit` users.
            #
            def self.online_users(limit=-1)
                ret = []
                DB["
                    SELECT u.id 
                    FROM \"user\" u
                    WHERE u.scraper_last_ping_time > CAST('#{now()}' AS TIMESTAMP) - INTERVAL '1 minutes'
                    AND u.scraper_share = true
                "].all { |row| 
                    # add object to array
                    u = BlackStack::Scraper::User.where(:id=>row[:id]).first
                    ret << u if u.available_for_assignation?
                    # break if limit reached
                    break if limit > 0 and ret.length >= limit
                    # release resources
                    GC.start
                    DB.disconnect
                }
                ret
            end

            # return array of of BlackStack::Scraper::User objects 
            # all belonging the account of this user, and 
            # who are running the extension right now, and who are
            # sharing their extension with other accounts.
            #
            # if limit > 0, return only the first `limit` users.
            # 
            def online_users(limit=-1)
                ret = []
                DB["
                    SELECT u.id 
                    FROM \"user\" u
                    WHERE u.scraper_last_ping_time > CAST('#{now()}' AS TIMESTAMP) - INTERVAL '1 minutes'
                    AND u.id_account = '#{self.id_account.to_guid}'
                "].all { |row| 
                    # add object to array
                    u = BlackStack::Scraper::User.where(:id=>row[:id]).first
                    ret << u if u.available_for_assignation?
                    # break if limit reached
                    break if limit > 0 and ret.length >= limit
                    # release resources
                    GC.start
                    DB.disconnect
                }
                ret
            end

            # register in the table `scr_activity` that the chrome extension of the user is active right now.
            # don't add more than 1 record per user per minute.
            def track_activity()
                # create the object, but don't save yet
                a = BlackStack::Scraper::Activity.new()
                a.id = guid
                a.create_time = now
                a.id_user = self.id
                a.year = a.create_time.year
                a.month = a.create_time.month
                a.day = a.create_time.day
                a.hour = a.create_time.hour
                a.minute = a.create_time.min
                a.active = true
                # don't add more than 1 record per user per minute.
                b = BlackStack::Scraper::Activity.where(
                    :id_user=>self.id,
                    :year=>a.year,
                    :month=>a.month,
                    :day=>a.day,
                    :hour=>a.hour,
                    :minute=>a.minute
                ).first
                a.save if b.nil?
            end

            # register in the table `scr_assignation` that a page was assigned to the user.
            # don't add more than 1 record per user per page per second.
            def track_assignation(page)
                # create the object, but don't save yet
                a = BlackStack::Scraper::Assignation.new()
                a.id = guid
                a.create_time = now
                a.id_user = self.id
                a.id_page = page.id
                a.year = a.create_time.year
                a.month = a.create_time.month
                a.day = a.create_time.day
                a.hour = a.create_time.hour
                a.minute = a.create_time.min
                a.second = a.create_time.sec
                # don't add more than 1 record per user per second.
                b = BlackStack::Scraper::Assignation.where(
                    :id_user=>self.id,
                    :id_page=>page.id,
                    :year=>a.year,
                    :month=>a.month,
                    :day=>a.day,
                    :hour=>a.hour,
                    :minute=>a.minute,
                    :second=>a.second
                ).first
                a.save if b.nil?
            end

            # return a string with the reason why the user is not available for assinging a page.
            # return nil if the user is available for assinging a page.
            #
            # decision made based on the records in the table `scr_assignation`, and 
            # its stealth configuration (`stealth_default_seconds_between_pages`, 
            # `stealth_default_seconds_between_pages_max`, `stealth_default_seconds_between_pages_min`).
            # 
            def why_not_available_for_assignation
                # get current datetime
                # get the last assignation
                a = BlackStack::Scraper::Assignation.where(:id_user=>self.id).order(:create_time).last
                # if there is no assignation, return true
                return nil if a.nil?
                # get the seconds between the last assignation and now
                seconds = (now - a.create_time).to_i
                # get the total assignations in the last hour
                total = BlackStack::Scraper::Assignation.where(
                    :id_user=>self.id, 
                    :create_time=>(now - 3600)..now
                ).count
                # get the total assignations in the last 24 hours
                total_24 = BlackStack::Scraper::Assignation.where(
                    :id_user=>self.id,
                    :create_time=>(now - 86400)..now
                ).count
                # return
                return 'daily quota reached' if total_24 >= self.stealth_default_max_pages_per_day
                return 'hourly quota reached' if total >= self.stealth_default_max_pages_per_hour
                return 'delay between pages not reached' if seconds < self.stealth_default_seconds_between_pages + rand(user.stealth_default_random_additional_seconds_between_pages)
            end

            # return true if the user is available for assinging a page, 
            # based on the records in the table `scr_assignation`, and 
            # its stealth configuration (`stealth_default_seconds_between_pages`, 
            # `stealth_default_seconds_between_pages_max`, `stealth_default_seconds_between_pages_min`).
            # 
            def available_for_assignation?
                self.why_not_available_for_assignation.nil?
            end

            # return on if the user's extension is active right now.
            def online?
                return false if self.scraper_last_ping_time.nil?
                return true if DB["
                    SELECT COUNT(*) 
                    FROM \"user\" u
                    WHERE u.id='#{self.id}' 
                    AND u.scraper_last_ping_time > CAST('#{now()}' AS TIMESTAMP) - INTERVAL '1 minutes'
                "].first[:count].to_i > 0  
                return false
            end

            # status of the user's extension
            # return `not installed` if the field `scraper_last_ping_time` is nil
            # return 'on' if difference between the function `now` and the field `scraper_last_ping_time` is lower than 1 minutes
            # return 'off' if difference between the function `now` and the field `scraper_last_ping_time` is higher or equel than 1 minutes
            # 
            def status_label
                return 'not installed' if self.scraper_last_ping_time.nil?
                return 'on' if self.online?
                return 'off'
            end


            # return a color to show the status of the user's extension
            def status_color
                label = self.status_label
                return 'gray' if label=='not installed'
                return 'green' if label=='on'
                return 'red' if label=='off'
            end

            # return 'yes' if the field `scraper_share` is true
            # return 'no' if the field `scraper_share` is false or nil
            def share_label
                return 'yes' if self.scraper_share
                return 'no'
            end

            # return a color to show the sharing of the user's extension
            def share_color
                label = self.share_label
                return 'green' if label=='yes'
                return 'gray' if label=='no'
            end

            # update scraper_stat_total_pages, scraper_stat_total_earnings, scraper_stat_total_payouts
            def update_stats
                # total pages
                a = BlackStack::Scraper::Movement.where(:id_user=>self.id, :type=>BlackStack::Scraper::Movement::TYPE_EARNING).count.to_i
                # total earnings
                b = BlackStack::Scraper::Movement.where(:id_user=>self.id, :type=>BlackStack::Scraper::Movement::TYPE_EARNING).sum(:amount).to_f
                # total payouts
                c = BlackStack::Scraper::Movement.where(:id_user=>self.id, :type=>BlackStack::Scraper::Movement::TYPE_PAYOUT).sum(:amount).to_f
                # save
                DB.execute("UPDATE \"user\" SET scraper_stat_total_pages=#{a.to_s}, scraper_stat_total_earnings=#{b.to_s}, scraper_stat_total_payouts=#{c.to_s} WHERE id='#{self.id}'")
            end

        end # class User
    end # module Scraper
end # module BlackStack