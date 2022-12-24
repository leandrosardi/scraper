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
                    ret << BlackStack::DfyLeads::Page.where(:id=>r[:id]).first
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

            # list of different stages and their names
            def self.stages()
                [STAGE_IDLE, STAGE_IN_PROGRESS, STAGE_COMPLETED, STAGE_FAILED]
            end

            def self.stage_name(stage)
                case stage
                when STAGE_IDLE
                    'Idle'
                when STAGE_IN_PROGRESS
                    'In Progress'
                when STAGE_COMPLETED
                    'Completed'
                when STAGE_FAILED
                    'Failed'
                else 
                    'Unknown'
                end
            end

            # decide the stage of this order
            def stage
                # it is idle if there are no pages
                ret = STAGE_IDLE
                # it is in progress if there are pages
                ret = STAGE_IN_PROGRESS if self.pages.count > 0
                # it is failed if there are pages and all of them are failed
                ret = STAGE_FAILED if self.pages.count > 0 and self.pages.select { |p| p.parse_success==false }.size > 0
                # it is completed if there are pages and all of them are completed with success
                ret = STAGE_COMPLETED if self.pages.count > 0 and self.pages.select { |p| p.parse_success==false }.size == self.pages.size
                # return
                ret
            end

            def stage_name
                self.class.stage_name(self.stage)
            end

            def stage_color
                res = 'gray'
                res = 'orange' if self.stage == STAGE_IDLE
                res = 'blue' if self.stage == STAGE_IN_PROGRESS
                res = 'green' if self.stage == STAGE_COMPLETED
                res = 'red' if self.stage == STAGE_FAILED
                res
            end

        end # class Order
    end # Scraper
end # BlackStack