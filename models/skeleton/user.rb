module BlackStack
    module Scraper
        # inherit from BlackStack::MySaaS::User
        class User < BlackStack::MySaaS::User

            # status of the user's extension
            # return `not installed` if the field `scraper_last_ping_time` is nil
            # return 'on' if difference between the function `now` and the field `scraper_last_ping_time` is lower than 1 minutes
            # return 'off' if difference between the function `now` and the field `scraper_last_ping_time` is higher or equel than 1 minutes
            def status_label
                return 'not installed' if self.scraper_last_ping_time.nil?
                return 'on' if DB["
                    SELECT COUNT(*) 
                    FROM \"user\" u
                    WHERE u.id='#{self.id}' 
                    AND u.scraper_last_ping_time > CAST('#{now()}' AS TIMESTAMP) - INTERVAL '1 minutes'
                "].first[:count].to_i > 0  
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
            
            # register the user's extension is active right now
            def track_activity
                # TODO: Code Me!
            end

        end # class User
    end # module Scraper
end # module BlackStack