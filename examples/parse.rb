require 'nokogiri'

=begin
# roll back ingested files as not ingested
source = "./sales-navigator-result-pages/page*.html" # the files to be imported
# ingest the bites
Dir.glob(source).each do |file|
    # get the name of the file from the full path
    name = file.split('/').last
    # rollingback the file
    print "Rollingback #{name}... "
    File.rename(file, file.gsub('page ', ''))
    puts 'done'
end
exit(0)
=end

output_file = './sales-navigator-result-pages/results.csv' # the output file
output = File.open(output_file, 'w')

i = 0
source = "./sales-navigator-result-pages/*.html" # the files to be imported
Dir.glob(source).each do |file|
    doc = Nokogiri::HTML(open(file))
    lis = doc.xpath('//li[contains(@class, "artdeco-list__item")]')    
    lis.each { |li|
        i += 1
        doc2 = Nokogiri::HTML(li.inner_html)
        n1 = doc2.xpath('//div[contains(@class,"artdeco-entity-lockup__title")]/a/span').first
        n2 = doc2.xpath('//div[contains(@class,"artdeco-entity-lockup__subtitle")]/a').first
        print "#{i.to_s}"
        line = []
        line << "\"#{n1.text.strip.gsub('"', '')}\"" if !n1.nil?
        line << "\"#{n2.text.strip.gsub('"', '')}\"" if !n2.nil?
        print ", #{line.join(',')}"
        output.puts line.join(',')
        output.flush
        puts
    }    
end

output.close


