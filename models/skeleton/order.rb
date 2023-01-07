module BlackStack
    module Scraper
        class Order < Sequel::Model(:scr_order)
            many_to_one :user, :class=>:'BlackStack::Scraper::User', :key=>:id_user
            one_to_many :pages, :class=>:'BlackStack::Scraper::Page', :key=>:id_order
            
            TYPE_SNS = 0 # Sales Navigator Search

            STAGE_IDLE = 0 # idle
            STAGE_IN_PROGRESS = 1
            STAGE_COMPLETED = 2
            STAGE_FAILED = 3

            # get the pages with an URL assigned 
            # and pending for visit/upload, with 
            # a try time lower than 5.
            def pending_pages(limit=-1, max_tries=5)
                ret = []
                # build the query
                q = "
                select p.id
                from scr_page p
                join scr_order o on (o.id=p.id_order and o.url is not null and o.status=true)
                where
                    id_order='#{self.id}' and
                    upload_reservation_id is null and
                    coalesce(upload_success,false)=false and 
                    coalesce(upload_reservation_times,0)<5
                order by p.create_time -- https://github.com/leandrosardi/scraper/issues/24
                "
                q += "limit #{limit}" if limit > 0                
                # load the object
                DB[q].all { |r| 
                    ret << BlackStack::DfyLeads::Page.select(:id, :number, :id_order).where(:id=>r[:id]).first
                    # release resources
                    GC.start
                    DB.disconnect
                }
                # return
                ret
            end

            # list of different stages and their names
            def status_color
                ret = 'gray'
                ret = 'green' if self.status == true
                ret = 'red' if self.status == false
                ret
            end

            def status_name
                ret = 'Paused'
                ret = 'Running' if self.status == true
                ret
            end

            # list of different types and their names
            def self.types()
                [TYPE_SNS]
            end

            def self.type_name(type)
                case type
                when TYPE_SNS
                    'Sales Navigator Search'
                end
            end



        end # class Order
    end # Scraper
end # BlackStack